from tortoise.models import Model
from tortoise import fields

class Users(Model):
	NAME = fields.TextField()
	ID = fields.IntField(pk=True)
	CREATED = fields.DatetimeField(auto_now_add=True)
	EMAIL = fields.CharField(max_length=255, unique=True)

	def __str__(self):
	    return self.NAME +' | '+self.EMAIL

class VerificationLinks(Model):
	USER = fields.CharField(max_length=255) # Email ID
	VALID_TILL = fields.DatetimeField(auto_now_add=False)
	LINK = fields.CharField(unique=True, max_length=600) # Two links cannot clash