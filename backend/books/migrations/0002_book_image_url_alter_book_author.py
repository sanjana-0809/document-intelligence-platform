from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("books", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="book",
            name="image_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="book",
            name="author",
            field=models.CharField(blank=True, default="Unknown Author", max_length=255),
        ),
    ]
