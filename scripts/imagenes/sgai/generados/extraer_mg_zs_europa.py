"""Generado por ScriptCreatorGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para:
https://news.mgmotor.eu/es/press/mg-zs-hybrid-premio/
Revisar antes de usar."""
import requests
from bs4 import BeautifulSoup
import json

def main():
    url = "https://news.mgmotor.eu/es/press/mg-zs-hybrid-premio/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    fotos_data = []
    header_img = soup.select_one('.headervisual img')
    if header_img:
        img_url = header_img.get('src')
        if header_img.get('srcset'):
            img_url = header_img.get('srcset').split(',')[-1].strip().split(' ')[0]
        fotos_data.append({
            "url": img_url,
            "titulo": header_img.get('alt', '')
        })
        
    gallery_links = soup.find_all('a', attrs={'data-fancybox': 'gallery'})
    for a in gallery_links:
        img = a.find('img')
        fotos_data.append({
            "url": a.get('href'),
            "titulo": img.get('alt', '') if img else ""
        })
        
    licencia_data = []
    footer = soup.find('footer')
    if footer:
        keywords = ['legal', 'privacidad', 'cookies', 'licencia', 'eula', 'términos', 'uso', 'copyright']
        for a in footer.find_all('a'):
            text = a.get_text(strip=True)
            href = a.get('href')
            if any(k in text.lower() or (href and k in href.lower()) for k in keywords):
                licencia_data.append({
                    "texto": text,
                    "url": href
                })
                
    output = {
        "fotos": fotos_data,
        "licencia": licencia_data
    }
    
    print(json.dumps(output, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()