/**
 * Not used anymore
 */

import prismaClient from '../src/utils/prismaClient'

async function main() {
    await prismaClient.post.create({
        data: {
            title: 'TicTacToe with Flutter',
            content: "I had made TicTacToe game with HTML-JS earlier, this time I made it with flutter.\n\nIn-game when one of the players wins the round boxes turn green if there is no winner all boxes turn grey.\n\nBoxes are GameBox widgets and there is a model class for boxes (Box). When I make a change in the Box model it is reflected in the GameBox widget.\n\n![image](http://localhost:8000/api/static/images_of_posts/postImages-m6e9smzyb6o.gif)\n\nGame arena consists of Center, AspectRatio and GridView widgets.\n\n## main.dart\n\n```Dart\nimport 'package:flutter/material.dart';\n\nimport 'home.dart';\n\nvoid main() {\n  runApp(const MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  const MyApp({Key? key}) : super(key: key);\n\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      debugShowCheckedModeBanner: false,\n      title: 'Flutter TicTacToe',\n      theme: ThemeData(\n        primarySwatch: Colors.blue,\n      ),\n      home: const HomePage(title: 'Flutter TicTacToe'),\n    );\n  }\n}\n```\n\n## home.dart\n\n```Dart\nimport 'package:flutter/material.dart';\nimport 'package:tictactoe/constants.dart';\n\nimport 'box.dart';\nimport 'game_box.dart';\n\nclass HomePage extends StatefulWidget {\n  const HomePage({Key? key, required this.title}) : super(key: key);\n\n  final String title;\n\n  @override\n  State<HomePage> createState() => _HomePageState();\n}\n\nclass _HomePageState extends State<HomePage> {\n  final winnerBoxColor = Colors.green;\n  final drawBoxColor = Colors.grey;\n\n  final _winnerMathces = <List<int>>[\n    [0, 1, 2],\n    [3, 4, 5],\n    [6, 7, 8],\n    [0, 3, 6],\n    [1, 4, 7],\n    [2, 5, 8],\n    [0, 4, 8],\n    [2, 4, 6],\n  ];\n\n  List<Box> _boxes = [];\n\n  bool _xOrder = true;\n  bool _gameFreeze = false;\n  int _xScore = 0, _oScore = 0;\n\n  bool _boxMatchControl(List<int> boxIndexes, GameMoves move) {\n    if (_boxes[boxIndexes[0]].move == move &&\n        _boxes[boxIndexes[1]].move == move &&\n        _boxes[boxIndexes[2]].move == move) {\n      return true;\n    }\n\n    return false;\n  }\n\n  void _markWinnerBoxes(List<int> match) {\n    for (var m in match) {\n      setState(() {\n        _boxes[m].color = winnerBoxColor;\n      });\n    }\n  }\n\n  void _markDrawBoxes() {\n    for (var box in _boxes) {\n      setState(() {\n        box.color = drawBoxColor;\n      });\n    }\n  }\n\n  void _winGame(GameMoves? winnerMove, List<int>? winnerBoxIndexes) async {\n    _gameFreeze = true;\n\n    if (winnerBoxIndexes != null) {\n      _markWinnerBoxes(winnerBoxIndexes);\n    } else {\n      _markDrawBoxes();\n    }\n\n    if (winnerMove == GameMoves.X) {\n      _xScore++;\n    } else if (winnerMove == GameMoves.O) {\n      _oScore++;\n    }\n\n    await Future.delayed(const Duration(milliseconds: 1500));\n    _resetGame();\n  }\n\n  void _detectWinner() async {\n    for (var match in _winnerMathces) {\n      if (_boxMatchControl(match, GameMoves.X)) {\n        _winGame(GameMoves.X, match);\n\n        return;\n      }\n\n      if (_boxMatchControl(match, GameMoves.O)) {\n        _winGame(GameMoves.O, match);\n\n        return;\n      }\n    }\n\n    // For DRAW\n    if (!_boxes.any((b) => b.move == null)) {\n      _winGame(null, null);\n\n      return;\n    }\n  }\n\n  void _markBox(Box box) {\n    if (box.move == null) {\n      setState(() {\n        _xOrder = !_xOrder;\n        box.move = _xOrder ? GameMoves.X : GameMoves.O;\n      });\n\n      _detectWinner();\n    }\n  }\n\n  List<GameBox> _boxWidgets() {\n    return _boxes\n        .map((box) => GameBox(\n              move: box.move,\n              color: box.color,\n              onTap: () {\n                if (_gameFreeze == false) {\n                  _markBox(box);\n                }\n              },\n            ))\n        .toList();\n  }\n\n  void _resetGame() {\n    setState(() {\n      _boxes = List.generate(9, (index) => Box(null, null));\n      _gameFreeze = false;\n    });\n  }\n\n  @override\n  void initState() {\n    _resetGame();\n\n    super.initState();\n  }\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        elevation: 0,\n        backgroundColor: Colors.white,\n        foregroundColor: Colors.blueGrey,\n        centerTitle: true,\n        title: Text('X | $_xScore - $_oScore | O',\n            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),\n      ),\n      body: Center(\n        child: AspectRatio(\n          aspectRatio: 1,\n          child: GridView.count(\n            physics: const NeverScrollableScrollPhysics(),\n            crossAxisCount: 3,\n            childAspectRatio: 1,\n            mainAxisSpacing: 5,\n            crossAxisSpacing: 5,\n            children: _boxWidgets(),\n          ),\n        ),\n      ),\n    );\n  }\n}\n```\n\n## box.dart (Box model)\n\n```Dart\nimport 'package:tictactoe/constants.dart';\nimport 'package:flutter/material.dart';\n\nclass Box {\n  GameMoves? move;\n  Color? color;\n\n  Box(this.move, this.color);\n}\n```\n\n## game_box.dart (Box Widget)\n\n```Dart\nimport 'package:flutter/material.dart';\nimport 'package:tictactoe/constants.dart';\n\nclass GameBox extends StatelessWidget {\n  final GameMoves? move;\n  final Color? color;\n  final VoidCallback onTap;\n\n  const GameBox({Key? key, required this.onTap, this.move, this.color})\n      : super(key: key);\n\n  Text _moveToText() {\n    const style = TextStyle(\n        color: Colors.white, fontWeight: FontWeight.bold, fontSize: 36);\n\n    switch (move) {\n      case GameMoves.X:\n        return const Text('X', style: style);\n      case GameMoves.O:\n        return const Text('O', style: style);\n      default:\n        return const Text('', style: style);\n    }\n  }\n\n  Color _moveToColor() => move == null\n      ? Colors.blue\n      : move == GameMoves.X\n          ? Colors.yellow\n          : Colors.red;\n\n  @override\n  Widget build(BuildContext context) {\n    return GestureDetector(\n      onTap: () {\n        onTap();\n      },\n      child: AnimatedContainer(\n        duration: const Duration(milliseconds: 500),\n        color: color ?? _moveToColor(),\n        alignment: Alignment.center,\n        child: _moveToText(),\n      ),\n    );\n  }\n}\n```\n\n## constants.dart\n\n```Dart\nenum GameMoves { X, O }\n```",
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Game Dev' },
                        where: { name: 'Game Dev' },
                    },
                ]
            },
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Validation Library with Typescript',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Typescript' },
                        where: { name: 'Typescript' },
                    },
                    {
                        create: { name: 'Node JS' },
                        where: { name: 'Node JS' },
                    },
                    {
                        create: { name: 'React' },
                        where: { name: 'React' },
                    },
                    {
                        create: { name: 'Next JS' },
                        where: { name: 'Next JS' },
                    },
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Unity' },
                        where: { name: 'Unity' },
                    },
                    {
                        create: { name: 'Validation' },
                        where: { name: 'Validation' },
                    },
                ]
            },
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'False Checks Table for Javascript: Are you doing it right?',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: '.Net' },
                        where: { name: '.Net' },
                    },
                    {
                        create: { name: 'c#' },
                        where: { name: 'c#' },
                    },
                    {
                        create: { name: 'HTML' },
                        where: { name: 'HTML' },
                    },
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    },
                    {
                        create: { name: 'Javascript' },
                        where: { name: 'Javascript' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Customizable React Zoom Controller',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'React' },
                        where: { name: 'React' },
                    },
                    {
                        create: { name: 'Next JS' },
                        where: { name: 'Next JS' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Getting started to Vue js',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Vue JS' },
                        where: { name: 'Vue JS' },
                    },
                    {
                        create: { name: 'Frontend' },
                        where: { name: 'Frontend' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'All you need to know about Next js',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Unity' },
                        where: { name: 'Unity' },
                    },
                    {
                        create: { name: 'Validation' },
                        where: { name: 'Validation' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Express js and Typescript',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    }
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'What is new on C#',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'c#' },
                        where: { name: 'c#' },
                    }
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Game development with Unity',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'HTML' },
                        where: { name: 'HTML' },
                    },
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    },
                    {
                        create: { name: 'Javascript' },
                        where: { name: 'Javascript' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'How to get a job?',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    }
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Macbook or windows pc?',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: { name: 'CSS' },
                        where: { name: 'CSS' },
                    },
                    {
                        create: { name: 'Flutter' },
                        where: { name: 'Flutter' },
                    },
                    {
                        create: { name: 'Unity' },
                        where: { name: 'Unity' },
                    },
                ]
            }
        }
    })

    await prismaClient.post.create({
        data: {
            title: 'Cell Phone Prices on 2024',
            content: `# Makale başlığı`,
            tags: {
                connectOrCreate: [
                    {
                        create: {name: 'Unity'},
                        where: {name: 'Unity'}
                    }
                ]
            }
        }
    })
}

main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prismaClient.$disconnect()
        process.exit(1)
    })