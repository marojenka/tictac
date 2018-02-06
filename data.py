# data classes used in python backend for tictac multiplayer game


class Gameboard(object):
    """
    gameboard of given size stored as list of lists two dimentional array.
    By default it's filled with zeroes.
    1 -- X
    2 -- O
    """

    values = [1, 2]

    def __init__(self):
        self.clear()

    def clear(self):
        """
        Clear the gameboard.
        Should be the same as destroy & recreate
        """
        self.turn_index = 0
        self.players = [None, None]
        self.moves = []
        self.data = {}

    def turn(self):
        """
        Give a value for automated move.
        Wont respect manual moves so be gentle
        """
        result = self.values[self.turn_index]
        if self.turn_index == 0:
            self.turn_index = 1
        else:
            self.turn_index = 0
        return result

    def validate_indexes(self, x, y):
        """
        validate that given indexes are two integers
        """
        return (isinstance(x, int) and isinstance(y, int))

    def validate_user(self, user):
        """
        check that given user can make a move
        """
        if self.players[self.turn_index] is None:
            self.players[self.turn_index] = user
        elif self.players[self.turn_index] != user:
            return False
        return True

    def cell(self, x, y):
        """
        get value from cell 
        Return None if index is not valid.
        """
        if self.validate_indexes(x, y):
            try:
                return self.data[x][y]
            except KeyError:
                return 0

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
        angles = [[1,   0],
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
                    if value == cell:
                        count[i] = count[i] + 1
                        step = step + 1
                    else:
                        break
        return max(count)

    def set(self, x, y, value=None):
        """ set value to cell with given coordinates """
        if not self.validate_indexes(x, y):
            raise ValueError("Can\'t edit using this indexes: %s", (x, y))
        if self.cell(x, y) != 0:
            raise ValueError("Cell is not empty: %s", (x, y))
        if value is None:
            value = self.turn()
        if x not in self.data:
            self.data[x] = {}
        self.data[x][y] = value
        count = self.check_for_win(x, y)
        return {'count': count, 'value': value}

    def move(self, x, y, user):
        """ make a move by user """
        if not self.validate_user(user):
            return None

        result = self.set(x, y)
        if result is not None:
            self.moves.append((x, y, result['value']))
        return result
