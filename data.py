# data classes used in python backend for tictac multiplayer game


class Gameboard(object):
    """
    gameboard of given size stored as list of lists two dimentional array.
    By default it's filled with zeroes.
    -1 -- O
    1  -- X
    """

    values = [1, 2]
    turn_index = 1

    def __init__(self, nx=30, ny=30):
        self.nx = nx
        self.ny = ny
        self.data = [[0 for y in range(ny)] for x in range(nx)]

    def clear(self):
        """
        Clear the gameboard.
        Should be the same as destroy & recreate
        """
        self.turn_index = 1
        # prob should be self.nx and self.ny right :thonking:
        for x in range(len(self.data)):
            for y in range(len(self.data[x])):
                self.data[x][y] = 0

    def turn(self):
        """
        Give a value for automated move.
        Wont respect manual moves so be gentle
        """
        if self.turn_index == 0:
            self.turn_index = 1
        else:
            self.turn_index = 0
        return self.values[self.turn_index]

    def validate_indexes(self, x, y):
        """
        validate that given indexes are not out of bound
        """
        if (x >= 0 and x < self.nx and
                y >= 0 and y < self.ny):
            return True  # SMART SMOrc
        else:
            return False

    def cell(self, x, y):
        """
        get value from cell [0<=x<nx, 0<=y<ny]
        Return None if index is out of bounds.
        """
        if self.validate_indexes(x, y):
            return self.data[x][y]
        else:
            return None

    def check_for_win(self, x, y):
        """
        Check that given cell isn't part of winning combination
        by counting largest number of neighbors with the same value
        in different directions.
        """
        # TODO:
        # should return not only count but set of winning parts?
        # Make sure that given indexes gives us fitter cell
        value = self.cell(x, y)
        if value not in (1, 2):
            return None
        # we set directions via set of 4 vectors
        # and also will check their oposites
        angles = [[1, 0],
                  [0, 1],
                  [1, 1],
                  [-1, 1]]
        # store nomber of neighbors in all directions
        # one variable would be enough tbh
        count = [1 for i in range(len(angles))]
        for i in range(len(angles)):
            for sign in (1, -1):
                step = 1
                while True:
                    cell = self.cell(x+sign*step*angles[i][0],
                                     y+sign*step*angles[i][1])
                    # print(x+sign*step*angles[i][0],
                    #       y+sign*step*angles[i][1],
                    #       '  ', cell)
                    if value == cell:
                        count[i] = count[i] + 1
                        step = step + 1
                    else:
                        break
        return max(count)

    def set(self, x, y, value=None):
        if not self.validate_indexes(x, y):
            raise ValueError('Can\'t edit using this indexes: %s', (x, y))
        if self.cell(x, y) != 0:
            raise ValueError('Cell is not empty: %s', (x, y))
        if value is None:
            value = self.turn()
        self.data[x][y] = value
        count = self.check_for_win(x, y)
        return {'count': count, 'value': value}

    def squish(self):
        values = []
        for x in range(len(self.data)):
            for y in range(len(self.data[x])):
                value = self.data[x][y]
                if value != 0:
                    values = values + [[x, y, value]]
        return values
