
import os

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Fix types and levels
    content = content.replace('"매우?잡"', '"매우혼잡"')
    content = content.replace('"?잡"', '"혼잡"')
    content = content.replace('"보통"', '"보통"')
    content = content.replace('"?유"', '"여유"')
    content = content.replace('case "매우?잡":', 'case "매우혼잡":')

    # Fix majorLocations array (common mangled cases)
    replacements = {
        '"강남??': '"강남역"',
        '"???구??': '"홍대입구역"',
        '"名洞"': '"명동"', # Sometimes mangled
        '"?실??': '"잠실역"',
        '"?울??': '"서울역"',
        '"?촌??': '"신촌역"',
        '"건??구??': '"건대입구역"',
        '"?태?역"': '"이태원역"',
        '"?면??': '"서면역"',
        '"?운??수?장"': '"해운대해수욕장"',
        '"부?역"': '"부산역"',
        '"광안리해?욕??': '"광안리해수욕장"',
        '"?천공항"': '"인천공항"',
        '"?도?트?파??': '"송도센트럴파크"',
        '"부?역"': '"부평역"',
        '"?성?': '"동성로"',
        '"반월?역"': '"반월당역"',
        '"??역"': '"대구역"', # Adjusting based on common patterns
        '"?성?천"': '"유성온천"',
        '"광주 금남?': '"광주 금남로"'
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    # Fix the missing closing quotes and commas if any
    content = content.replace('lat:', ', lat:') # Sometimes the comma is missing
    content = content.replace(', , lat:', ', lat:') # Dedup commas

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/components/CongestionMonitoring.tsx')
print("Fixed CongestionMonitoring.tsx")
