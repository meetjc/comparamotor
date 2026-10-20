"""Generado por ScriptCreatorGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para:
https://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/jul/0722-GrooveMexico.html
Revisar antes de usar."""
import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin

def main():
    url = "https://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/jul/0722-GrooveMexico.html"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        html_content = response.text
    except:
        html_content = ""

    soup = BeautifulSoup(html_content, 'html.parser')
    
    extracted_data = {
        "fotos": [],
        "licencia": []
    }
    
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if not src:
            continue
            
        parent_a = img.find_parent('a')
        if parent_a and parent_a.get('href'):
            href = parent_a.get('href').lower()
            if any(ext in href for ext in ['.jpg', '.jpeg', '.png', '.tiff', '.zip']):
                src = parent_a.get('href')
        
        extracted_data["fotos"].append({
            "url": urljoin(url, src),
            "titulo": img.get('alt') or img.get('title') or ""
        })
    
    footer = soup.find('footer') or soup.find(class_=lambda x: x and 'footer' in x.lower()) or soup
    
    license_keywords = ['licencia', 'derechos', 'términos', 'uso', 'creative commons', 'legal', 'copyright', 'privacidad']
    seen_urls = set()
    
    for link in footer.find_all('a'):
        text = link.get_text(strip=True)
        href = link.get('href')
        if href and any(kw in text.lower() for kw in license_keywords):
            full_url = urljoin(url, href)
            if full_url not in seen_urls:
                extracted_data["licencia"].append({
                    "texto": text,
                    "url": full_url
                })
                seen_urls.add(full_url)
                
    print(json.dumps(extracted_data, ensure_ascii=False, indent=4))

if __name__ == "__main__":
    main()