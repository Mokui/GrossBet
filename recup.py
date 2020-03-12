import urllib
import os
# RECUPERE LES IMAGES DU SERVEUR POUR LES SPRITES
i=0
os.chdir('./assets')
while i<75 :
    urllib.urlretrieve("https://jonkantner.com/experiments/stick_fight/sprites/player2/player" + str(i) + ".svg", "player2_"+str(i)+".svg")
    print(i)
    i = i+1