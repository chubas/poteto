from django.db import models
from django.contrib.auth.models import User

class Background(models.Model):
	creator = models.ForeignKey(User)
	name = models.CharField(max_length = 50)
	created_on = models.DateField(auto_now_add = True)
	image = models.ImageField(upload_to = 'images/backgrounds')
	def __str__(self):
		return self.name;

class CharacterProfile(models.Model):
	creator = models.ForeignKey(User)
	name = models.CharField(max_length = 50)
	created_on = models.DateField(auto_now_add = True)
	thumbnail = models.ImageField(upload_to = 'images/char_profiles')
	def __str__(self):
		return self.name;

class Character(models.Model):
	character_profile = models.ForeignKey(CharacterProfile)
	image = models.ImageField(upload_to = 'images/characters')
	created_on = models.DateField(auto_now_add = True)
	def __str__(self):
		return str(self.character_profile.name) + "_" + str(self.id);

class Comic(models.Model):
	creator = models.ForeignKey(User)
	title = models.CharField(max_length = 50, blank=True)
	description = models.TextField(blank=True)
	created_on = models.DateField(auto_now_add = True)
	num_boxes = models.PositiveSmallIntegerField();
	for n in (1,2,3):
		exec('narration_' + str(n) + " = models.CharField(max_length = '200', blank=True)");
		exec('background_' + str(n) + " = models.ForeignKey(\
			Background,\
			null=True,\
			blank=True,\
			related_name='comic_in_" + str(n) + "')");
		for dir in ('left', 'right'):
			exec('character_' + str(n) + "_" + dir + " = models.ForeignKey(\
				Character,\
				null=True,\
				blank=True,\
				related_name='comic_in_ " + str(n) + "_" + dir + "')");
			exec('dialogue_' + str(n) + "_" + dir + " = models.CharField(max_length = '200', blank=True)");

	def get_absolute_url(self):
		return "/show/" + str(self.id) + "/"

	def iterator_for_template(self):
		list = []
		for i in range(1, self.num_boxes + 1):
			i = str(i)
			list.append({
				'i':i,
				'narration':self.__getattribute__('narration_' + i),
				'background':self.__getattribute__('background_' + i),
				'left':{
					'character':self.__getattribute__('character_' + i + '_left'),
					'dialogue':self.__getattribute__('dialogue_' + i + '_left')
				},
				'right':{
					'character':self.__getattribute__('character_' + i + '_right'),
					'dialogue':self.__getattribute__('dialogue_' + i + '_right')
				}
			})
		return list


class Comment(models.Model):
	author = models.ForeignKey(User)
	comic = models.ForeignKey(Comic)
	body = models.TextField()

class Rating(models.Model):
	user = models.ForeignKey(User)
	comic = models.ForeignKey(Comic)
	score = models.PositiveSmallIntegerField()

