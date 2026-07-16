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

def adjust_json():
    json_name = "./all_task_score/all_task_old.json"
    with open(json_name, "r", encoding="utf-8") as f:
        data_old = json.load(f)
    json_name = "./all_task_score/all_task_claude_94.6.json"
    with open(json_name, "r", encoding="utf-8") as f:
        data = json.load(f)
    task_id_list = []
    for item in data_old:
        if item["task_id"] in task_id_list:
            print("error")
        task_id_list.append(item["task_id"])
    data_dict = {}
    for item in data:
        data_dict[item["task_id"]] = item
    new_data = []
    for task_id in task_id_list:
        new_data.append(data_dict[task_id])
    with open("./all_task.json", "w", encoding="utf-8") as f:
        json.dump(new_data, f, ensure_ascii=False, indent=4)

def compute_ave_score():
    json_name = "./all_task_score/all_task_claude_94.12.json"
    with open(json_name, "r", encoding="utf-8") as f:
        data = json.load(f)
    score_list = []
    for item in data:
        score_list.append(item["score"])
    ave_score = sum(score_list) / len(score_list)
    print(ave_score)
    ## 94.64, 94.32, 94.12-->96.36

if __name__ == "__main__":
    # adjust_json()
    compute_ave_score()