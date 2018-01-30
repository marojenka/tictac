# data classes used in python backend for tictac multiplayer game

class Gameboard(object):
    """
    gameboard of given size stored as list of lists two dimentional array.
    By default it's filled with zeroes.
    -1 -- O
    1  -- X
    """

    def __init__(self, nx=30, ny=30):
        self.nx = nx
        self.ny = ny
        self.data = [[0 for y in range(ny)] for x in range(nx)]

    def cell(self, x, y):
        if (x > 0 and x < self.nx and
                y > 0 and y < self.ny ):
            return self.data[x][y]
        else:
            return None

    def check(self, x, y):
        count = [1 for i in range(3)]
        angles = [[1, 0],
                  [0, 1],
                  [1, 1],]
        value = self.data[x][y]
        for i in range(len(angles)):
            for sign in (1, -1):
                step = angles[i][:]
                while True:
                    cell = self.cell(x+sign*step[0], y-sign*step[1])
                    if value == cell:
                        count[i] = count[i] + 1
                        if step[0] != 0: step[0] = step[0] + 1
                        if step[1] != 0: step[1] = step[1] + 1
                    else:
                        break
            print(count[i])
        return max(count)

    def set(self, x, y, value):
        if self.cell(x, y) != 0:
            # raise ValueError('Cell is not empty')
            pass
        self.data[x][y] = value
        # check that game is not over.
        # to do that we will check neares neighbors.
        # |

g = Gameboard(5,5)
g.set(1,1,1)
g.set(2,1,1)
g.set(3,1,1)
g.set(2,2,1)
g.data
g.check(2, 1)
