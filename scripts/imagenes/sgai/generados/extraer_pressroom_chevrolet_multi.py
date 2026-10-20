"""Generado por ScriptCreatorMultiGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para la sala de prensa de Chevrolet México.
Revisar antes de usar."""
import requests
from bs4 import BeautifulSoup
import json

def main():
    urls = [
        "http://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/oct/1029_Tracker26MY.html",
        "http://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/jul/0722-GrooveMexico.html"
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    base_url = "https://pressroom.chevrolet.com.mx"
    keywords = ['copyright', 'derechos', 'términos', 'licencia', 'legal', 'creative commons', 'aviso', 'privacidad', 'uso']
    
    combined_data = {
        "fotos": [],
        "licencia": []
    }

    for url in urls:
        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code != 200:
                continue
            soup = BeautifulSoup(response.text, 'html.parser')
        except:
            continue

        for img in soup.find_all('img'):
            src = img.get('data-src') or img.get('src')
            if not src:
                continue
            
            if not src.startswith('http'):
                src = base_url + src
                
            alt_text = img.get('alt') or img.get('title') or "Sin título"
            
            combined_data["fotos"].append({
                "url": src,
                "titulo_alt": alt_text.strip()
            })

        footer = soup.find('footer') or soup
        for link in footer.find_all('a'):
            link_text = link.get_text(strip=True)
            href = link.get('href', '')
            
            if any(kw in link_text.lower() or kw in href.lower() for kw in keywords):
                if href and not href.startswith('http'):
                    href = base_url + href
                
                license_entry = {
                    "texto": link_text,
                    "url": href
                }
                
                if license_entry not in combined_data["licencia"]:
                    combined_data["licencia"].append(license_entry)

    print(json.dumps(combined_data, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()