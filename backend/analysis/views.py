from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from backend.analysis.models import Entity, Relationship
from .entity_extractor import analyze_text
# Create your views here.


from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Entity, Relationship
from .entity_extractor import analyze_text

@api_view(['POST'])
def analyze_text_view(request):
    text = request.data.get('text', '')
    if not text:
        return Response({'error': 'No text provided'}, status=400)

    # Use entity_extractor.py to process the text
    entities, svos, _ = analyze_text(text)

    # Save entities to the database
    for entity_type, entity_list in entities.items():
        for entity_name in entity_list:
            Entity.objects.get_or_create(name=entity_name, entity_type=entity_type)

    # Save relationships to the database
    for subj, verb, obj in svos:
        subject_entity, _ = Entity.objects.get_or_create(name=subj)
        object_entity, _ = Entity.objects.get_or_create(name=obj)
        Relationship.objects.get_or_create(subject=subject_entity, verb=verb, object=object_entity)

    return Response({'entities': entities, 'relationships': svos})