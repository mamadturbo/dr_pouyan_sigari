from pathlib import Path
from PIL import Image, ImageDraw

root = Path('design-review')
routes = ['home','about','expertise','publications','blog','blog-first-consultation','blog-finding-research','contact','404']
for width in (390,768,805,1440):
    cell_width = min(width,480)
    thumb_height = round(min(900,646 if width == 805 else 900)*cell_width/width)
    board = Image.new('RGB',(cell_width*3,(thumb_height+32)*3),'#edf4f1')
    draw = ImageDraw.Draw(board)
    for index,route in enumerate(routes):
        source = Image.open(root/'after'/f'{route}-{width}.png').convert('RGB')
        image = source.crop((0,0,source.width,min(source.height,646 if width==805 else 900)))
        image.thumbnail((cell_width,thumb_height))
        x,y=(index%3)*cell_width,(index//3)*(thumb_height+32)
        draw.text((x+8,y+8),f'{route} / {width}px',fill='#173c34')
        board.paste(image,(x,y+32))
    board.save(root/f'board-{width}.jpg',quality=90)
