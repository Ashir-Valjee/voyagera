from django.shortcuts import render

# Create your views here.

from django.http import JsonResponse
from django.views import View
from django.core.files.storage import default_storage
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class FileUploadView(View):
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return JsonResponse({'error': 'No file provided.'}, status=400)

        file_path = f"profile_pics/{file_obj.name}"
        # Save to file path
        file_name = default_storage.save(file_path, file_obj)
        file_url = default_storage.url(file_name)

        return JsonResponse({'fileUrl': file_url})
