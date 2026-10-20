"""Generado por ScriptCreatorGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para:
https://mexico.nissannews.com/es-MX/releases/release-e753262aecb841cf03e379a163160058?gallery=release-e753262aecb841cf03e379a163160058&viewallTab=photos
Revisar antes de usar."""
import requests
from bs4 import BeautifulSoup
import json

def main():
    url = "https://mexico.nissannews.com/es-MX/releases/release-e753262aecb841cf03e379a163160058?gallery=release-e753262aecb841cf03e379a163160058&viewallTab=photos"
    base_url = "https://mexico.nissannews.com"
    
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    extracted_data = {
        "fotos": [],
        "licencia": []
    }
    
    photo_containers = soup.find_all('div', {'data-basket-item-type': 'Photo'})
    for container in photo_containers:
        img_tag = container.find('img')
        alt_text = img_tag.get('alt', '') if img_tag else ''
        
        download_link = ""
        download_options = container.find_all('a', class_='download-button')
        
        for link in download_options:
            span = link.find('span')
            if span and "Alta Resolución" in span.get_text():
                download_link = base_url + link.get('href', '')
                break
        
        if not download_link and download_options:
            download_link = base_url + download_options[0].get('href', '')
            
        if not download_link and img_tag:
            download_link = img_tag.get('src', '')

        extracted_data["fotos"].append({
            "titulo_alt": alt_text,
            "url_descarga": download_link
        })
        
    footer_legal = soup.find('div', class_='nissan-footer__links')
    if footer_legal:
        links = footer_legal.find_all('a')
        for link in links:
            text = link.get_text(strip=True)
            href = link.get('href', '')
            if not href.startswith('http'):
                href = base_url + href
            
            extracted_data["licencia"].append({
                "texto": text,
                "url": href
            })
            
    print(json.dumps(extracted_data, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()