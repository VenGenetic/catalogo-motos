import os
import sys
from PIL import Image

def get_dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            total += os.path.getsize(fp)
    return total

def format_size(size_bytes):
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"

def optimize_image(file_path, max_width, max_height, quality=75, format_to_save=None):
    if not os.path.exists(file_path):
        return 0, 0, False
    
    orig_size = os.path.getsize(file_path)
    
    try:
        with Image.open(file_path) as img:
            orig_w, orig_h = img.size
            
            # Check if we need resizing
            if orig_w > max_width or orig_h > max_height:
                ratio = min(max_width / orig_w, max_height / orig_h)
                new_w = int(orig_w * ratio)
                new_h = int(orig_h * ratio)
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                resized = True
            else:
                resized = False
                new_w, new_h = orig_w, orig_h
                
            ext = os.path.splitext(file_path)[1].lower()
            save_format = format_to_save if format_to_save else img.format
            
            # Determine save options
            save_kwargs = {}
            if save_format == 'PNG' or ext == '.png':
                save_kwargs['optimize'] = True
                # If image has no alpha, convert to RGB to save space
                if img.mode in ('RGBA', 'LA') and not has_transparency(img):
                    img = img.convert('RGB')
            elif save_format == 'WEBP' or ext == '.webp':
                save_kwargs['quality'] = quality
                save_kwargs['method'] = 6  # high quality compression setting
                
            # Temporary save to check if size decreases
            temp_path = file_path + "_temp" + ext
            img.save(temp_path, format=save_format, **save_kwargs)
            new_size = os.path.getsize(temp_path)
            
            # Replace only if new size is smaller
            if new_size < orig_size:
                os.replace(temp_path, file_path)
                return orig_size, new_size, True
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return orig_size, orig_size, False
    except Exception as e:
        print(f"Error optimizing {file_path}: {e}")
        return orig_size, orig_size, False

def has_transparency(img):
    if img.info.get("transparency", None) is not None:
        return True
    if img.mode == "P":
        transparent = img.info.get("transparency")
        if transparent is not None:
            return True
    elif img.mode == "RGBA":
        extrema = img.getextrema()
        if extrema[3][0] < 255:
            return True
    return False

def main():
    base_dir = r"c:\Users\ASUS\Documents\Xsistem\catalogo-motos-main\catalogo-motos"
    public_dir = os.path.join(base_dir, "public")
    
    print("=" * 60)
    print("🚀 IMAGES OPTIMIZATION SCRIPT")
    print("=" * 60)
    
    # 1. Optimize Hero Banners (PNGs)
    banners = [
        ("hero-nueva.png", 1920, 1080),
        ("banner.png", 1920, 1080)
    ]
    
    print("\n[1/4] Optimizing Home Banners...")
    for banner_name, max_w, max_h in banners:
        path = os.path.join(public_dir, banner_name)
        orig, new, ok = optimize_image(path, max_w, max_h, quality=85)
        if ok:
            print(f"✅ {banner_name}: {format_size(orig)} -> {format_size(new)} (Saved {format_size(orig - new)} / {(orig-new)/orig*100:.1f}%)")
        else:
            print(f"ℹ️ {banner_name}: No change needed or already optimized ({format_size(orig)})")
            
    # 2. Optimize Error 404 image
    print("\n[2/4] Optimizing Error 404 Image...")
    path = os.path.join(public_dir, "Error_404.webp")
    orig, new, ok = optimize_image(path, 800, 800, quality=75)
    if ok:
        print(f"✅ Error_404.webp: {format_size(orig)} -> {format_size(new)} (Saved {format_size(orig - new)} / {(orig-new)/orig*100:.1f}%)")
    else:
        print(f"ℹ️ Error_404.webp: No change needed or already optimized ({format_size(orig)})")

    # 3. Optimize Spare Parts Images
    print("\n[3/4] Optimizing Spare Parts Images...")
    parts_dir = os.path.join(public_dir, "imagenes_repuestos")
    
    total_orig = 0
    total_new = 0
    optimized_count = 0
    processed_count = 0
    
    if os.path.exists(parts_dir):
        # Count total files first for progress logging
        all_files = []
        for root, _, files in os.walk(parts_dir):
            for file in files:
                if file.lower().endswith(('.webp', '.png', '.jpg', '.jpeg')):
                    all_files.append(os.path.join(root, file))
        
        total_files = len(all_files)
        print(f"Found {total_files} spare parts images. Starting optimization...")
        
        for idx, fp in enumerate(all_files):
            processed_count += 1
            orig, new, ok = optimize_image(fp, 500, 500, quality=75)
            total_orig += orig
            total_new += new
            if ok:
                optimized_count += 1
            
            # Print progress every 500 files
            if processed_count % 500 == 0 or processed_count == total_files:
                print(f"   Progress: {processed_count}/{total_files} images processed...")
                        
        print(f"✅ Processed {processed_count} spare parts images.")
        print(f"✅ Re-optimized {optimized_count} images.")
        print(f"📊 Spare parts total size: {format_size(total_orig)} -> {format_size(total_new)}")
        if total_orig > 0:
            print(f"📊 Saved: {format_size(total_orig - total_new)} ({(total_orig - total_new)/total_orig*100:.1f}%)")
    else:
        print("❌ Spare parts directory not found.")
        
    # 4. Optimize Model Images
    print("\n[4/4] Optimizing Model Images...")
    models_dir = os.path.join(public_dir, "modelos")
    
    total_orig_m = 0
    total_new_m = 0
    optimized_count_m = 0
    processed_count_m = 0
    
    if os.path.exists(models_dir):
        all_files_m = []
        for root, _, files in os.walk(models_dir):
            for file in files:
                if file.lower().endswith(('.webp', '.png', '.jpg', '.jpeg')):
                    all_files_m.append(os.path.join(root, file))
                    
        total_files_m = len(all_files_m)
        print(f"Found {total_files_m} model images. Starting optimization...")
        
        for idx, fp in enumerate(all_files_m):
            processed_count_m += 1
            orig, new, ok = optimize_image(fp, 500, 500, quality=75)
            total_orig_m += orig
            total_new_m += new
            if ok:
                optimized_count_m += 1
                
            if processed_count_m % 200 == 0 or processed_count_m == total_files_m:
                print(f"   Progress: {processed_count_m}/{total_files_m} images processed...")
                        
        print(f"✅ Processed {processed_count_m} model images.")
        print(f"✅ Re-optimized {optimized_count_m} images.")
        print(f"📊 Model images total size: {format_size(total_orig_m)} -> {format_size(total_new_m)}")
        if total_orig_m > 0:
            print(f"📊 Saved: {format_size(total_orig_m - total_new_m)} ({(total_orig_m - total_new_m)/total_orig_m*100:.1f}%)")
    else:
        print("ℹ️ Model images directory not found.")
        
    print("\n" + "=" * 60)
    print("🎉 IMAGE OPTIMIZATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
