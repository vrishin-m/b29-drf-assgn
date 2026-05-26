from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from projects.models import Task
from comments.models import Comment
from .models import Notification

User = get_user_model()


@receiver(post_save, sender=Task)
def create_task_notification(sender, instance, created, **kwargs):
    creator_val = getattr(instance, 'created_by', None)
    assigned_val = getattr(instance, 'assignee_id', getattr(instance, 'assigned_user', None))


    creator_user = None
    recipient_user = None
    if creator_val: 
        creator_user = creator_val if isinstance(creator_val, User) else User.objects.filter(id=creator_val).first()   
    if assigned_val:
        recipient_user = assigned_val if isinstance(assigned_val, User) else User.objects.filter(id=assigned_val).first()


    if recipient_user:
            Notification.objects.create(
                recipient=recipient_user, 
                actor=creator_user,      
                event_type=Notification.TASK_ASSIGNED,
                payload={
                    "task_id": str(instance.id),
                    "task_title": getattr(instance, 'title', 'Untitled Task'),
                }
            )

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        recipient = task.assignee_id
        
        if recipient:
            Notification.objects.create(
                recipient=recipient,
                actor=instance.author,
                event_type=Notification.COMMENT_ADDED,
                payload={
                    "task_id": str(task.id),
                    "task_title": task.title,
                    "comment_preview": instance.text[:50] 
                }
            )