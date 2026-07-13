import json
import ast

def data_process():
    txt_name = "./all_task.txt"
    json_name = "./all_task.json"
    with open(txt_name, "r", encoding="utf-8") as f:
        lines = f.readlines()
    data = []
    for line in lines:
        line = line.strip()
        data.append(line)
    s = data[0]
    obj = json.loads(bytes(s, "utf-8").decode("unicode_escape"))
    with open(json_name, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    data_process()