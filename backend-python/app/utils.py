import re

def get_device_info(user_agent):
    """Pobiera informacje o urządzeniu z User-Agent"""
    if not user_agent:
        return "Unknown Device"
    
    # Sprawdź czy to mobile
    mobile_patterns = [
        r'Mobile', r'Android', r'iPhone', r'iPad', r'Windows Phone'
    ]
    
    is_mobile = any(re.search(pattern, user_agent, re.IGNORECASE) for pattern in mobile_patterns)
    
    # Sprawdź system operacyjny
    if 'Windows' in user_agent:
        os = 'Windows'
    elif 'Mac' in user_agent:
        os = 'macOS'
    elif 'Linux' in user_agent:
        os = 'Linux'
    elif 'Android' in user_agent:
        os = 'Android'
    elif 'iOS' in user_agent or 'iPhone' in user_agent or 'iPad' in user_agent:
        os = 'iOS'
    else:
        os = 'Unknown'
    
    # Sprawdź przeglądarkę
    if 'Chrome' in user_agent:
        browser = 'Chrome'
    elif 'Firefox' in user_agent:
        browser = 'Firefox'
    elif 'Safari' in user_agent:
        browser = 'Safari'
    elif 'Edge' in user_agent:
        browser = 'Edge'
    elif 'Brave' in user_agent:
        browser = 'Brave'
    else:
        browser = 'Unknown'
    
    device_type = "Mobile" if is_mobile else "Desktop"
    
    return f"{device_type} - {os} - {browser}"
