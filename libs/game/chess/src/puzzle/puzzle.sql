create table chess_puzzle (
    id int not null auto_increment,
    name varchar(255) not null,
    fen varchar(255) not null,
    solution varchar(255) not null,
    primary key (id)
);
