from django.db import models

class Entity(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.type})"
    
class Relationship(models.Model):
    subject = models.ForeignKey(Entity, related_name='subject_relationships', on_delete=models.CASCADE)
    verb = models.CharField(max_length=255)
    object = models.ForeignKey(Entity, related_name='object_relationships', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.subject} -> {self.verb} -> {self.object}"