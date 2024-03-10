import re
import os
from datetime import datetime
import zipfile
from flask import Flask, request, abort, render_template, send_file
from lib.pdf import download_pdf, split_pdf, extract_slices

app = Flask(__name__)

DOWNLOADS_DIR = 'downloads'

@app.route('/')
def index():
    return render_template('index.html')
 
@app.route('/api/preview', methods=['POST'])
def preview_pdf():
    url = request.json.get('url')
    
    pdf_content = download_pdf(url)
    if pdf_content is None:
        abort(404)
        
    pages = split_pdf(pdf_content)
    
    return pages


@app.route('/api/split', methods=['POST'])
def split():
    url = request.json.get('url')
    slices = request.json.get('outputs')
    paddingX = request.json.get('paddingX')
    paddingY = request.json.get('paddingY')
    
    date = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    download_filename = f'download.{date}.zip'
    
    pdf_content = download_pdf(url)
    
    if pdf_content is None:
        abort(404)
        
    slices = extract_slices(pdf_content, slices, paddingX, paddingY)
    
    # create a zip file and put all slices in it
    with zipfile.ZipFile(os.path.join(DOWNLOADS_DIR, download_filename), 'w') as z:
        for slice in slices:
            z.writestr(slice['filename'], slice['image'])
        
    return {'download_url': f'/downloads/{download_filename}'}

@app.route('/downloads/<filename>', methods=['GET'])
def download_sliced_images(filename):
    
    filepath = os.path.join(DOWNLOADS_DIR, filename)
    if not os.path.exists(filepath):
        abort(404)

    return send_file(filepath, as_attachment=True)
    
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')