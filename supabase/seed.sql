


insert into tamagotchi_status
    (status, updatedat)
values
    ('{"happiness": 0, "hunger": 0, "health": 0, "age": 1}', NOW());



insert into tamagotchi_interactions
    (interaction, metadata)
values
    ('BORN', '{}',  NOW())

