from django.db import models

class DeployedContract(models.Model):
    name = models.CharField(max_length=100, unique=True)
    address = models.CharField(max_length=42)

    def __str__(self):
        return f"{self.name} deployed at {self.address}"
