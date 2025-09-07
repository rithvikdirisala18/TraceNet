from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from analysis.models import Entity, Relationship
from .entity_extractor import analyze_text
# Create your views here.

@api_view(['POST'])
def analyze_text_view(request):
    text = request.data.get('text', '')
    if not text:
        return Response({'error': 'No text provided'}, status=400)
    
    try:
        entities, svos, _ = analyze_text(text)

        for entity_type, entity_list in entities.items():
            for entity_name in entity_list:
                Entity.objects.get_or_create(name=entity_name, entity_type=entity_type)

        for subj, verb, obj in svos:
            subject_entity, _ = Entity.objects.get_or_create(name=subj)
            object_entity, _ = Entity.objects.get_or_create(name=obj)
            Relationship.objects.get_or_create(subject=subject_entity, verb=verb, object=object_entity)


        return Response({'entities': entities, 'relationships': svos}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
def health_check(request):
    return Response({"status": "ok", "message": "API is working"})