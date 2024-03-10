from flask import Flask, request, abort, render_template
from lib.pdf import download_pdf, split_pdf

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
        
    pages = split_pdf(pdf_content, 50)
    
    return pages

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')