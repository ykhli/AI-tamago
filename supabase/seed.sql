


insert into tamagotchi_status
    (status, updatedat)
values
    ('{"happiness": 5, "hunger": 5, "health": 5, "age": 1}', NOW());



insert into tamagotchi_interactions
    (interaction, metadata, updatedat)
values
    ('BORN', '{}',  NOW())

