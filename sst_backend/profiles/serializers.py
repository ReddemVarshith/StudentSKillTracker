from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
        return user

from .models import HackathonParticipation
import cloudinary

class CloudinaryURLField(serializers.Field):
    """Returns the full https:// Cloudinary URL for a CloudinaryField."""
    def to_representation(self, value):
        if not value:
            return None
        # value is a CloudinaryResource or a string public_id
        try:
            return cloudinary.CloudinaryImage(str(value)).url
        except Exception:
            return str(value)

    def to_internal_value(self, data):
        return data


class HackathonParticipationSerializer(serializers.ModelSerializer):
    participation_certificate = CloudinaryURLField(required=True)
    winning_certificate = CloudinaryURLField(required=False, allow_null=True)

    class Meta:
        model = HackathonParticipation
        fields = '__all__'
        read_only_fields = ['student']
