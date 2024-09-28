from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

def create_connection():
    """ MySQL veritabanına bağlanmak için bir bağlantı oluşturur """
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            database='restaurant_db',  # Veritabanı adı
            user='basar',              # Kullanıcı adı
            password='your_password'   # Şifre (buraya kendi şifrenizi ekleyin)
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None

def query_database(query):
    """ Veritabanında sorgu çalıştırır ve sonuçları döndürür """
    connection = create_connection()
    if connection is None:
        return []
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Menu %s", ('%' + query + '%',))
        results = cursor.fetchall()
        return results
    except Error as e:
        print(f"Error: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '')
    results = query_database(query)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
