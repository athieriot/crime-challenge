package controllers

import play.api._
import play.api.mvc._
import play.api.libs.ws.WS
import play.api.libs.ws.Response
import scala.concurrent.Future
import scala.concurrent.Await
import scala.concurrent.duration._
import play.api.libs.concurrent.Promise
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller {

  def index = Action {
    Thread.sleep(5000)

    Ok(views.html.index("Your new application is ready."))
  }

  val call: Future[Response] = {
    WS.url("http://localhost:9000/").get()
  }

  def demoSync = Action {

    println("------------")
    println("This is gonna be legen")
    println("------------")

    val finalResponse = Await.result(call, Duration(6000, "millis"))
    println("Wait for it !")
    println("------------")

    println("dary !")
    println("------------")

    Ok(finalResponse.status.toString)
  }

  def demo = Action {
    Async {
      println("------------")
      println("This is gonna be legen")
      println("------------")

      val future = call.map { response => 
        println("dary")
        println("--------")

        Ok(response.status.toString)
      }

      println("Wait for it !")
      println("------------")

      future
    }
  }
}
