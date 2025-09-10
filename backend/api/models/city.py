from django.db import models

class City(models.Model):
    country = models.CharField(max_length=255)
    city = models.CharField(max_length=255)

    class Meta:
        db_table = "cities"
        unique_together = ("city","country")
        verbose_name_plural = "Cities"

    def __str__(self):
        return f"{self.city}, {self.country}"