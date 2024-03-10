from flask import Flask, request, abort, render_template
from lib.pdf import download_pdf, split_pdf, extract_slices

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')
 
@app.route('/api/download', methods=['POST'])
def download():
    url = request.json.get('url')
    
    pdf_content = download_pdf(url)
    if pdf_content is None:
        abort(404)
        
    pages = split_pdf(pdf_content)
    
    return pages


@app.route('/api/split', methods=['POST'])
def split():
    url = request.json.get('url')
    outputs = request.json.get('outputs')
    paddingX = request.json.get('paddingX')
    paddingY = request.json.get('paddingY')
    
    pdf_content = download_pdf(url)
    
    if pdf_content is None:
        abort(404)
        
    slices = extract_slices(pdf_content, outputs, paddingX, paddingY)
    for slice in slices:
        f = open(slice['filename'], 'wb')
        f.write(slice['image'])
        f.close()

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')