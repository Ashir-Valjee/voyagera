from django.conf import settings
from django.db import models
from .city import City

class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

   
    profile_pic_url = models.URLField(blank=True)

    # placeholder until City model exists; will convert to FK later
    home_city = models.ForeignKey( 
        City,
        null = False,
        blank = False,
        on_delete=models.CASCADE
    )

    likes_music = models.BooleanField(default=False)
    likes_sports = models.BooleanField(default=False)
    likes_arts = models.BooleanField(default=False)
    likes_film = models.BooleanField(default=False)
    likes_family = models.BooleanField(default=False)


    # handy timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "profiles"

    def __str__(self):
        return f"Profile<{self.user_id}>"
