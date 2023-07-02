import cornac
import data
import torch


model = cornac.models.BiVAECF(
    k=data.LATENT_DIM,
    encoder_structure=data.ENCODER_DIMS,
    act_fn=data.ACT_FUNC,
    likelihood=data.LIKELIHOOD,
    n_epochs=data.NUM_EPOCHS,
    batch_size=data.BATCH_SIZE,
    learning_rate=data.LEARNING_RATE,
    seed=None,
    use_gpu=torch.cuda.is_available(),
    verbose=True
)