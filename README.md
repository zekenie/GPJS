What is GPJS
================
Genetic programming is a technique that allows computers to write programs. The genetic programmer must first write a function that can evaluate program-candidates. This is called the fitness function. This function evaluates a candidate program and returns some form of score. The genetic programmer must also build a random code generator that can produce random programs. With these two components, one can build the first steps of a GP system by generating many random programs and evaluating them with the fitness function. Typically, none of the random programs come close to a good score, but some are better than others. Thus far, this is mildly interesting, but not powerful. In order to leverage principals of Darwinian evolution, programs must be able to "reproduce."

A simple genetic programming system is completed when programs can mutate and/or breed with one another. A mutate function takes a program and returns a modified version of that program. A crossover function takes two programs, removes a piece of one and replaces it with a piece of the other. To run the finished GP system, generate a series of random programs. Rate their fitnesses. Pick some of the better programs and breed them to produce a new series. Each series is called a generation. If the system is working properly, the programs' fitness should improve over time.

Genetic programming is a deep and rich field. There are countless papers published on variations of each of the concepts explained above.

# What is Symbolic Regression

Symbolic regression is a GP technique that attempts mathematically explain data. In some ways, it is analogous to linear regression. In linear regression two-dimensional (x, y) data is modeled by a linear function. Symbolic regression is similar except there are no requirements on the type of function and the data can be n-dimensional (x, y, z, ...). Functions are generated through GP. Symbolic regression is powerful when searching through complex data.

# Motivation
As scientific tests become less expensive and more abundant, scientists are facing increasingly [large datasets](http://europepmc.org/abstract/MED/19620020). Symbolic regression has potential as a tool for scientists to make sense of the mess they're in. But, it faces a problem. The barrier to entry is too high. This was the inspiration for building webGP. I wanted to give people a way to run GP on data they have sitting in an excel file or database.
