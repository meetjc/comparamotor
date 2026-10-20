"""Generado por ScriptCreatorGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para:
https://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/oct/1029_Tracker26MY.html
Revisar antes de usar."""
import requests
from bs4 import BeautifulSoup
import json
import urllib.parse

def main():
    url = "https://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/oct/1029_Tracker26MY.html"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        results = {
            "fotos": [],
            "licencia": []
        }

        base_url = "https://pressroom.chevrolet.com.mx"

        for media_item in soup.find_all(['div', 'a'], class_=['media-item', 'image-container', 'asset']):
            img = media_item.find('img')
            download_btn = media_item.find('a', href=True, string=lambda x: x and ('Descargar' in x or 'Download' in x))
            
            if img:
                img_src = img.get('src', '')
                alt_text = img.get('alt', img.get('title', ''))
                
                high_res_url = img_src
                if download_btn:
                    high_res_url = download_btn['href']
                elif media_item.name == 'a' and media_item.get('href'):
                    high_res_url = media_item['href']

                if high_res_url:
                    full_url = urllib.parse.urljoin(base_url, high_res_url)
                    results["fotos"].append({
                        "url": full_url,
                        "titulo": alt_text
                    })

        footer = soup.find(['footer', 'div'], class_=['footer', 'legal', 'bottom-nav'])
        if not footer:
            footer = soup

        keywords = ['licencia', 'derechos', 'términos', 'uso', 'legal', 'copyright', 'creative commons']
        for link in footer.find_all('a', href=True):
            link_text = link.get_text(strip=True)
            if any(kw in link_text.lower() for kw in keywords):
                results["licencia"].append({
                    "texto": link_text,
                    "url": urllib.parse.urljoin(base_url, link['href'])
                })

        print(json.dumps(results, indent=4, ensure_ascii=False))

    except Exception:
        print(json.dumps({"fotos": [], "licencia": []}))

if __name__ == "__main__":
    main()