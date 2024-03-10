import re
import io
import os
import requests
from pdf2image import convert_from_bytes
import numpy as np
import base64

def download_pdf(url):
    
    cache_filename = re.sub(r"\W", "_", url) + ".pdf"
    cache_filename = os.path.join("cache", cache_filename)


    if os.path.exists(cache_filename):
        # read from cache
        with open(cache_filename, "rb") as f:
            return f.read()

    response = requests.get(url)
    if response.status_code == 200:
        # write to cache
        # convert url to filename for caching
        with open(cache_filename, "wb") as f:
            f.write(response.content)
        return response.content
    else:
        return None


def split_pdf(pdf_content, empty_space_height):
    # Convert PDF to images
    images = convert_from_bytes(pdf_content)

    # Skip the first page
    images = images[1:]

    pages = []

    # Split images into questions
    for image in images:
        # Convert image to RGB
        image = image.convert('RGB')

        # Convert image to grayscale and then to numpy array for processing
        image_gray = image.convert('L')
        image_data = np.array(image_gray)

        # Find rows where all pixels are white
        white_rows = np.all(image_data == 255, axis=1)

        # Find groups of consecutive white rows
        white_groups = np.split(white_rows, np.where(np.diff(white_rows) != 0)[0] + 1)
        
        # convert groups to slices
        slices = [{
            'height': len(group),
            'is_empty': group[0].item(),
        } for group in white_groups]
        
        # # connect small empty spaces
        # i = 1
        # while i < len(slices) - 1:
        #     if slices[i]['is_empty'] and slices[i]['height'] < empty_space_height:
        #         slices[i-1]['height'] += slices[i]['height'] + slices[i+1]['height']
        #         del slices[i+1]
        #         del slices[i]
        #     else:
        #         i += 1
                
        # save image as png bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='PNG')
            
        pages.append({
            'image': base64.b64encode(image_bytes.getvalue()).decode('utf-8'),
            'slices': slices,
        })

    return pages
