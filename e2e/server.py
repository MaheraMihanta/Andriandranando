"""Serve Django against a temporary database for the browser tests only."""
import os
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
database = Path(os.environ['DATABASE_PATH']).resolve()
if not database.parent.name.startswith('ny-andriandranando-') or database.name != 'test.sqlite3':
    raise RuntimeError('Les tests navigateur exigent une base temporaire séparée.')
sys.path.insert(0, str(root))
os.environ['DJANGO_SETTINGS_MODULE'] = 'siteSmk.settings'

import django
django.setup()

from django.core.management import call_command
from posts.models import Actualite

call_command('migrate', interactive=False, verbosity=0)
Actualite.objects.get_or_create(titre='Rencontre de test navigateur', defaults={
    'resume': 'Une rencontre fictive pour vérifier le site.',
    'contenu': 'Première ligne de test.\nDeuxième ligne de test.',
    'categorie': 'rencontre', 'publie': True,
})
Actualite.objects.get_or_create(titre='Brouillon privé de test', defaults={
    'resume': 'Ne doit pas être public.', 'contenu': 'Brouillon.', 'publie': False,
})
call_command('runserver', '127.0.0.1:8011', use_reloader=False)
