size =255

for i in range(size):
    for j in range(size):
        glyph ="*"
        if i  & j:
            glyph=" "
        print(glyph),
    print("")
    
    