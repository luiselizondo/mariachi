#!/bin/bash
echo "Exporting database definition to installer/database.sql"
mysqldump -u -p --no-data mariachi > ../installer/database.sql
