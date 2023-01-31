import random
import numpy as np

lShape = [
  [(0, 0), (1, 0), (2, 0), (2, 1)],
  [(0, 0), (0, 1), (0, 2), (1, 0)],
  [(0, 0), (0, 1), (1, 1), (2, 1)],
  [(1, 0), (1, 1), (1, 2), (0, 2)],
]

inversLShape = [
  [(2, 0), (0, 1), (1, 1), (2, 1)],
  [(0, 0), (1, 0), (1, 1), (1, 2)],
  [(0, 0), (0, 1), (1, 0), (2, 0)],
  [(0, 0), (0, 1), (0, 2), (1, 2)]
]

zShape = [
  [(0, 0), (0, 1), (1, 1), (1, 2)],
  [(0, 1), (1, 1), (1, 0), (2, 0)],
  [(0, 0), (0, 1), (1, 1), (1, 2)],
  [(0, 1), (1, 1), (1, 0), (2, 0)]
]

inversZShape = [
  [(1, 0), (1, 1), (0, 1), (0, 2)],
  [(0, 0), (1, 0), (1, 1), (2, 1)],
  [(1, 0), (1, 1), (0, 1), (0, 2)],
  [(0, 0), (1, 0), (1, 1), (2, 1)]
]

tShape = [
  [(0, 0), (0, 1), (0, 2), (1, 1)],
  [(0, 1), (1, 0), (1, 1), (2, 1)],
  [(0, 1), (1, 0), (1, 1), (1, 2)],
  [(0, 0), (1, 0), (1, 1), (2, 0)]
]

oShape = [
  [(0, 0), (0, 1), (1, 0), (1, 1)],
  [(0, 0), (0, 1), (1, 0), (1, 1)],
  [(0, 0), (0, 1), (1, 0), (1, 1)],
  [(0, 0), (0, 1), (1, 0), (1, 1)]
]

iShape = [
  [(0, 0), (1, 0), (2, 0), (3, 0)],
  [(0, 0), (0, 1), (0, 2), (0, 3)],
  [(0, 0), (1, 0), (2, 0), (3, 0)],
  [(0, 0), (0, 1), (0, 2), (0, 3)]
]

shapes = [lShape, inversLShape, zShape, inversZShape, tShape, oShape, iShape]


def create_grid(grid):
    for i in range(20):
        grid.append([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    return grid


def draw_shape(shape, grid, current_row, current_col):
    for i in range(len(shape)):
        grid[current_row + shape[i][0]][current_col + shape[i][1]] = 1

    return grid


def delete_shape(shape, grid, current_row, current_col):
    for i in range(len(shape)):
        grid[current_row + shape[i][0]][current_col + shape[i][1]] = 0

    return grid


def create_population():
    population = []
    for i in range(1000):
        population.append([random.uniform(-1, 1), random.uniform(-1, 1),
                           random.uniform(-1, 1), random.uniform(-1, 1), 0])

    population = np.array(population)
    return population


def is_not_right(random_shape, rotation, current_col):
    for i in range(len(shapes[random_shape][rotation])):
        if current_col + shapes[random_shape][rotation][i][1] >= 9:
            return False
    return True


def in_shape(shape, index):
    for i in range(len(shape)):
        if shape[i][0] == index:
            return True
    return False


def touch_another_shape(shape, grid, current_row, current_col):
    for i in range(len(shape)):
        if grid[current_row + shape[i][0] + 1][current_col] == 1 and not (in_shape(shape, shape[i][0] + 1)):
            return True

    return False


def move_to_bottom(shape, current_row, current_col, grid):
    lowest = 0
    for i in range(len(shape)):
        if shape[i][0] > shape[lowest][0]:
            lowest = i
    while current_row + shape[lowest][0] < 19 and not touch_another_shape(shape, grid, current_row, current_col):
        current_row += 1
    grid = draw_shape(shape, grid, current_row, current_col)

    return grid, current_row


def calculate_aggregate_height(grid):
    height = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            if grid[i][j] == 1 and height[j] == 0:
                height[j] = 20 - i
    agg_height = 0
    for i in range(10):
        agg_height += height[i]

    return agg_height


def complete_lines(grid):
    nr = 0
    for i in range(len(grid)):
        complete = True
        for j in range(len(grid[i])):
            if grid[i][j] != 1:
                complete = False
        if complete:
            nr += 1
    return nr


def calculate_number_of_holes(grid):
    nr = 0
    for i in range(1, len(grid)):
        for j in range(len(grid[i])):
            if grid[i][j] == 0 and grid[i-1][j] == 1:
                nr += 1
    return nr


def calculate_bumpiness(grid):
    height = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            if grid[i][j] == 1 and height[j] == 0:
                height[j] = 20 - i

    bumpiness = 0
    for i in range(9):
        bumpiness += abs(height[i] - height[i+1])
    return bumpiness


def choose_the_best(values, random_shape, grid):
    best_score = None
    for i in range(4):
        current_col = 0
        current_row = 0
        while is_not_right(random_shape, i, current_col):
            [grid, current_row] = move_to_bottom(shapes[random_shape][i],
                                                 current_row, current_col,
                                                 grid)

            height = calculate_aggregate_height(grid)
            cmplt_lines = complete_lines(grid)
            nr_of_holes = calculate_number_of_holes(grid)
            bumpiness = calculate_bumpiness(grid)
            fitness = values[0] * height + values[1] * cmplt_lines + values[2] * nr_of_holes + values[3] * bumpiness
            if best_score is None or fitness > best_score:
                best_score = fitness
                rotation_number = i
                colNr = current_col
            grid = delete_shape(shapes[random_shape][i], grid, current_row,
                                current_col)
            current_col += 1
            current_row = 0

    return [rotation_number, colNr]


def add_score(score, grid):
    for i in range(len(grid)):
        complete = True
        for j in range(len(grid[i])):
            if grid[i][j] == 0:
                complete = False
        if complete:
            for j in range(10):
                grid[i][j] = 0
            for j in range(i, 0, -1):
                for k in range(10):
                    grid[j][k] = grid[j-1][k]
            score += 1
    return score, grid


def get_max_height(grid):
    height = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for i in range(len(grid)):
        for j in range(len(grid[i])):
            if grid[i][j] == 1 and height[j] == 0:
                height[j] = 20 - i
    max_height = height[0]
    for i in range(1, 10):
        if height[i] > max_height:
            max_height = height[i]
    return max_height


def game_over(grid):
    return get_max_height(grid) >= 17


def calculate_fitness(values, grid):
    score = 0
    is_game_over = False
    k = 0
    while k < 500 and not (is_game_over):
        current_row = 0
        random_shape = random.randrange(0, len(shapes))

        parameters = choose_the_best(values, random_shape, grid)
        current_shape = shapes[random_shape][parameters[0]]
        current_col = parameters[1]
        [grid, current_row] = move_to_bottom(current_shape, current_row,
                                             current_col, grid)
        [score, grid] = add_score(score, grid)
        is_game_over = game_over(grid)
        k += 1
    return score


def main():
    grid = []
    grid = create_grid(grid)
    population = create_population()

    for i in range(1000):
        for j in range(1000):
            population[j][4] = calculate_fitness(population[j], grid)
        offsprings = []

        for j in range(150):
            selected = []
            for k in range(1000):
                selected.append(False)
            rand = random.randrange(0, 1000)
            selected[rand] = True
            maxi1 = rand
            maxi2 = rand
            for k in range(100):
                rand = random.randrange(0, 1000)
                while selected[rand]:
                    rand = random.randrange(0, 1000)
                if population[rand][4] > population[maxi1][4]:
                    maxi2 = maxi1
                    maxi1 = rand
                elif population[rand][4] > population[maxi2][4]:
                    maxi2 = rand
            if random.uniform(0, 1) > 0.05: 
                offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
            else:
                randomnr = random.randrange(0, 4)
                if randomnr == 0:
                    if random.uniform(0, 1) > 0.5:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6 + 0.2,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4 + 0.2,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
                    else:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6 - 0.2,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4 - 0.2,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
                elif randomnr == 1:
                    if random.uniform(0, 1) > 0.5:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6 + 0.2,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4 + 0.2,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
                    else:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6 - 0.2,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4 - 0.2,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
                elif random.uniform(0, 1) == 2:
                    if random.uniform(0, 1) > 0.5:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6 + 0.2,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4 + 0.2,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
                    else:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6 - 0.2,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4 - 0.2,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4, 0])
                else:
                    if random.uniform(0, 1) > 0.5:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6 + 0.2, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4 + 0.2, 0])
                    else:
                        offsprings.append([population[maxi1][0]*0.4 + population[maxi2][0]*0.6,
                        population[maxi1][1] * 0.4 + population[maxi2][1] * 0.6,
                        population[maxi1][2] * 0.4 + population[maxi2][2] * 0.6,
                        population[maxi1][3] * 0.4 + population[maxi2][3] * 0.6 - 0.2, 0])

                        offsprings.append([population[maxi1][0]*0.6 + population[maxi2][0]*0.4,
                        population[maxi1][1] * 0.6 + population[maxi2][1] * 0.4,
                        population[maxi1][2] * 0.6 + population[maxi2][2] * 0.4,
                        population[maxi1][3] * 0.6 + population[maxi2][3] * 0.4 - 0.2, 0])  
        array_sort = population[population[:, 4].argsort()]


        for k in range(len(offsprings)):
            offsprings[k][4] = calculate_fitness(offsprings[k], grid)

        for k in range(700, 1000):
            array_sort[k] = offsprings[k-700]
        population = np.copy(array_sort)

        array_sort = population[population[:, 4].argsort()]
        
        if (i%50 == 0):
            print(i)

        if i%100 == 0:
            print(array_sort[999][0], array_sort[999][1], array_sort[999][2], array_sort[999][3], array_sort[999][4])


main()
