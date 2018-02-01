import random
from socket import gethostname
with open('usertokens.txt', 'a+') as tokens:
    token = '%030x' % random.randrange(16**random.randint(64, 128))
    if tokens.tell(): tokens.write('\n')

    tokens.write(token)

print 'URL: https://%s:3000/user/%s/' % (gethostname(), token)