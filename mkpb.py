import sys 
import json
course={}
course["holes"]=[]
course["description"]="description"
with open(sys.argv[1]) as x: f = x.readlines()
for i,v in enumerate(f):
    if not (v == "\n"):
        course["holes"].append({'expression':v.rstrip(),'notes':""})
print(json.dumps(course))
