import re
import io
import os
import requests
from pdf2image import convert_from_bytes
import numpy as np
import base64
import PIL
from typing import TypedDict

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


def split_pdf(pdf_content):
    '''Split PDF into small slices using white spaces.'''

    # Convert PDF to images
    images = convert_from_bytes(pdf_content)

    pages = []
    
    width = images[0].width
    height = images[0].height

    # Split images into slices
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
        
        # save image as png bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='PNG')
            
        pages.append({
            'image': base64.b64encode(image_bytes.getvalue()).decode('utf-8'),
            'slices': slices,
        })

    return {
        'width': width,
        'height': height,
        'pages': pages,
    }
    

class OutputSlice(TypedDict):
    top: int
    height: int
    filename: str
    

class ExtractedSlice(TypedDict):
    image: bytes
    filename: str


def find_bounding_rect(image: PIL.Image) -> tuple[int, int, int, int]:
    # Convert image to grayscale and then to numpy array for processing
    image_gray = image.convert('L')
    inverted_image = PIL.ImageOps.invert(image_gray)
    return inverted_image.getbbox()
    
def image_to_png_bytes(image: PIL.Image) -> bytes:
    '''Convert image to PNG bytes.'''
    image_bytes = io.BytesIO()
    image.save(image_bytes, format='PNG')
    return image_bytes.getvalue()

def extract_slices(pdf_content: bytes, slices: list[list[OutputSlice]], paddingX: int, paddingY: int) -> list[ExtractedSlice]:
    '''Extract slices from PDF.'''

    # Convert PDF to images
    pdf_images = convert_from_bytes(pdf_content)
    
    # extract images
    extracted_images = []
    for i, page in enumerate(slices):
        for slice in page:
            extracted_image = pdf_images[i].crop((0, slice['top'], pdf_images[i].width, slice['top'] + slice['height']))
            extracted_images.append({
                'image': extracted_image,
                'filename': slice['filename'],
                'link': slice.get('link', False),
            })

    # link linked images
    i = 0
    while i < len(extracted_images):
        if extracted_images[i]['link'] and i > 0:
            new_height = extracted_images[i-1]['image'].size[1] + extracted_images[i]['image'].size[1] + paddingY
            new_image = PIL.Image.new('RGB', (extracted_images[i]['image'].size[0], new_height), (255, 255, 255))
            new_image.paste(extracted_images[i-1]['image'], (0, 0))
            new_image.paste(extracted_images[i]['image'], (0, extracted_images[i-1]['image'].size[1] + paddingY))
            extracted_images[i-1]['image'] = new_image
            del extracted_images[i]
        else:
            i += 1
            
    # crop paddings
    bounding_rects = [find_bounding_rect(extracted_image['image']) for extracted_image in extracted_images]
    min_left = min([rect[0] for rect in bounding_rects])
    max_right = max([rect[2] for rect in bounding_rects])
    
    for i, slice in enumerate(extracted_images):
        im = slice['image'].crop((min_left, bounding_rects[i][1], max_right, bounding_rects[i][3]))
        im2 = PIL.Image.new('RGB', (im.size[0] + paddingX * 2, im.size[1] + paddingY * 2), (255, 255, 255))
        im2.paste(im, (paddingX, paddingY))
        slice['image'] = im2
        
    # save image as png bytes
    result = [
        {
            'filename': slice['filename'],
            'image': image_to_png_bytes(slice['image']),
        } for slice in extracted_images
    ]
        
    return result

