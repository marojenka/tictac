import pytest
from data import Gameboard

def test_gameboard():
    user1 = 'foo'
    user2 = 'bar'
    g = Gameboard()
    assert g.move(1, 1, user1) == {'count': 1, 'value': 1}
    assert g.move(2, 2, user2) == {'count': 1, 'value': 2}
    assert g.move(1, 2, user1) == {'count': 2, 'value': 1}
    assert g.move(1, 123, user2) == {'count': 1, 'value': 2}
    assert g.move(-1, 123, user1) == {'count': 1, 'value': 1}


