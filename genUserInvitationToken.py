import random

with open('usertokens.txt', 'a+') as tokens:
    token = '%030x' % random.randrange(16**random.randint(64, 128))
    if tokens.tell(): tokens.write('\n')

    tokens.write(token)

print 'URL: https://server/user/%s/' % token