import os

src_dir = r"d:\DH_FPT\DuyLongTech_Project_master\frontend\src"

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            if "localhost:8080" in content:
                print(f"Updating {file_path}")
                content = content.replace("http://localhost:8080/api", "https://duylongtech-project-master.onrender.com/api")
                content = content.replace("http://localhost:8080/ws", "wss://duylongtech-project-master.onrender.com/ws")
                content = content.replace("localhost:8080", "duylongtech-project-master.onrender.com")
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)

print("Done")
