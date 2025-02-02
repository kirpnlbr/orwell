import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import DistilBertModel

class Model(nn.Module):
    def __init__(self, bert, hidden_sizes=[768, 384, 192], dropout_rates=[0.3, 0.3, 0.3]):
        super(Model, self).__init__()
        self.bert = bert

        for param in list(self.bert.parameters())[:-4]:
            param.requires_grad = False

        self.fc_layers = nn.ModuleList()
        self.bn_layers = nn.ModuleList()
        self.dropout_layers = nn.ModuleList()

        for i in range(len(hidden_sizes) - 1):
            self.fc_layers.append(nn.Linear(hidden_sizes[i], hidden_sizes[i + 1]))
            self.bn_layers.append(nn.BatchNorm1d(hidden_sizes[i + 1]))
            self.dropout_layers.append(nn.Dropout(dropout_rates[i]))

        self.output_layer = nn.Linear(hidden_sizes[-1], 3)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0]

        x = pooled
        for fc, bn, dropout in zip(self.fc_layers, self.bn_layers, self.dropout_layers):
            residual = x if x.shape == fc(x).shape else None
            x = dropout(x)
            x = fc(x)
            x = bn(x)
            x = F.gelu(x)
            if residual is not None:
                x = x + residual

        x = F.dropout(x, p=0.5, training=self.training)
        output = self.output_layer(x)
        return torch.sigmoid(output)

def load_model(model_path, device):
    # Initialize BERT
    bert = DistilBertModel.from_pretrained('distilbert-base-uncased')
    
    # Create model instance
    model = Model(bert)
    
    # Load the saved state
    checkpoint = torch.load(model_path, map_location=device)
    
    # Load state dict
    if 'model_state' in checkpoint:
        model.load_state_dict(checkpoint['model_state'])
    else:
        model.load_state_dict(checkpoint)
    
    model.to(device)
    model.eval()
    return model