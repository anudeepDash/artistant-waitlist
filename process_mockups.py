import os
import colorsys
from PIL import Image

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

color1 = hex_to_rgb('#F25A2B') # Orange
color2 = hex_to_rgb('#D4567A') # Pink
color3 = hex_to_rgb('#7C5CFF') # Purple

def get_gradient_color(t):
    # t is between 0 and 1
    if t < 0.5:
        # Interpolate between color1 and color2
        t = t * 2
        c1, c2 = color1, color2
    else:
        # Interpolate between color2 and color3
        t = (t - 0.5) * 2
        c1, c2 = color2, color3
    
    r = int(c1[0] * (1 - t) + c2[0] * t)
    g = int(c1[1] * (1 - t) + c2[1] * t)
    b = int(c1[2] * (1 - t) + c2[2] * t)
    return (r, g, b)

def process_image(filepath):
    print(f"Processing {filepath}...")
    try:
        img = Image.open(filepath).convert("RGBA")
    except Exception as e:
        print(f"Failed to open {filepath}: {e}")
        return

    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Convert to HSV
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            h_deg = h * 360
            
            # Detect "lime green"
            # Hue between 60 and 160 is green/lime/emerald
            if 60 <= h_deg <= 160 and s > 0.35 and v > 0.35:
                # Calculate gradient based on X coordinate
                t = x / float(width)
                grad_r, grad_g, grad_b = get_gradient_color(t)
                
                # Blend the lightness of the original pixel to preserve shading/anti-aliasing
                # V represents brightness. We can scale the gradient color.
                new_r = int(grad_r * v)
                new_g = int(grad_g * v)
                new_b = int(grad_b * v)
                
                pixels[x, y] = (new_r, new_g, new_b, a)
                
    img.convert("RGB").save(filepath)
    print(f"Saved {filepath}")

if __name__ == '__main__':
    mockups_dir = os.path.join("public", "mockups")
    for filename in os.listdir(mockups_dir):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            process_image(os.path.join(mockups_dir, filename))
