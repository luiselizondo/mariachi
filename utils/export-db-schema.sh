#!/bin/bash
echo "Exporting database definition to installer/database.sql"
mysqldump -uroot -p --no-data mariachi > ../installer/database.sql
