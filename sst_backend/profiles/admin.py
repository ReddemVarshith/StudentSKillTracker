from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'hall_ticket_number', 'department', 'batch')
    search_fields = ('name', 'hall_ticket_number', 'email_id')
    list_filter = ('department', 'batch', 'section')
